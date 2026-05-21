'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const sql = process.env.POSTGRES_URL
  ? postgres(process.env.POSTGRES_URL, { ssl: 'require' })
  : null;

type SqlClient = ReturnType<typeof postgres>;

const isDatabaseAvailable = (value: SqlClient | null): value is SqlClient =>
  Boolean(value);

const getSql = (): SqlClient => {
  if (!sql) {
    throw new Error('Database unavailable');
  }
  return sql;
};

// Zod schema for validation
const InvoiceSchema = z.object({
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select a valid status.',
  }),
});

const CreateInvoice = InvoiceSchema;
const UpdateInvoice = InvoiceSchema;

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(
  prevState: State,
  formData: FormData,
): Promise<State> {
  // Validate form data
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  // Convert amount to cents for database storage
  const amountInCents = Math.round(amount * 100);
  const date = new Date().toISOString().split('T')[0];

  try {
    if (!isDatabaseAvailable(sql)) {
      throw new Error('Database unavailable');
    }

    await getSql()`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
): Promise<State> {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = Math.round(amount * 100);

  try {
    if (!isDatabaseAvailable(sql)) {
      throw new Error('Database unavailable');
    }

    await getSql()`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string): Promise<void> {
  try {
    if (!isDatabaseAvailable(sql)) {
      throw new Error('Database unavailable');
    }

    await getSql()`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete invoice.');
  }

  revalidatePath('/dashboard/invoices');
}
