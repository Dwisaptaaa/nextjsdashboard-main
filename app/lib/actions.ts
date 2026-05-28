'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect, notFound } from 'next/navigation';
import { z } from 'zod';
import type { User } from './definitions';
import { users as mockUsers } from './placeholder-data';

const sql = process.env.POSTGRES_URL
  ? postgres(process.env.POSTGRES_URL, { ssl: 'require' })
  : null;

type SqlClient = ReturnType<typeof postgres>;

const isDatabaseAvailable = (value: SqlClient | null): value is SqlClient =>
  Boolean(value);

const getSql = (): SqlClient => {
  if (!sql) {
    throw new Error(
      'Database unavailable. Please set POSTGRES_URL environment variable.'
    );
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

export async function authenticate(
  email: string,
  password: string,
): Promise<Omit<User, 'password'>> {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    throw new Error('Email and password are required.');
  }

  try {
    if (!isDatabaseAvailable(sql)) {
      const mockUser = mockUsers.find(
        (user) => user.email.toLowerCase() === normalizedEmail,
      );
      if (!mockUser || mockUser.password !== password) {
        throw new Error('Invalid email or password.');
      }
      const { password: _password, ...publicUser } = mockUser;
      return publicUser;
    }

    const rows = await getSql()`SELECT id, name, email, password FROM users WHERE email = ${normalizedEmail}`;
    const user = rows[0];
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const bcrypt = (await import('bcrypt')) as any;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid email or password.');
    }

    return {
      id: String(user.id),
      name: String(user.name),
      email: String(user.email),
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to authenticate.',
    );
  }
}

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
      throw new Error(
        'Database Error: POSTGRES_URL not configured. Please set database credentials in environment variables.',
      );
    }

    // Ensure the customer exists before creating an invoice
    const customerRow = await getSql()`SELECT id FROM customers WHERE id = ${customerId}`;
    if (!customerRow || !customerRow[0]) {
      return {
        message: 'Customer not found. Please choose a valid customer.',
      };
    }

    console.log('📝 Creating invoice:', { customerId, amountInCents, status, date });

    await getSql()`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    console.log('✅ Invoice created successfully');
  } catch (error) {
    console.error('❌ Database Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(errorMessage.includes('POSTGRES_URL') || errorMessage.includes('Database unavailable')
      ? errorMessage
      : 'Failed to create invoice.');
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
      throw new Error(
        'Database Error: POSTGRES_URL not configured. Please set database credentials in environment variables.',
      );
    }

    // Ensure the invoice exists; otherwise produce a 404
    const existing = await getSql()`SELECT id FROM invoices WHERE id = ${id}`;
    if (!existing || !existing[0]) {
      notFound();
    }

    console.log('📝 Updating invoice:', { id, customerId, amountInCents, status });

    await getSql()`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;

    console.log('✅ Invoice updated successfully');
  } catch (error) {
    console.error('❌ Database Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(errorMessage.includes('POSTGRES_URL') || errorMessage.includes('Database unavailable')
      ? errorMessage
      : 'Failed to update invoice.');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string): Promise<void> {
  try {
    if (!isDatabaseAvailable(sql)) {
      console.warn('⚠️ Database not available - set POSTGRES_URL environment variable');
      throw new Error(
        'Database Error: POSTGRES_URL not configured. Please set database credentials in environment variables.'
      );
    }

    // Ensure the invoice exists before attempting a delete
    const existing = await getSql()`SELECT id FROM invoices WHERE id = ${id}`;
    if (!existing || !existing[0]) {
      notFound();
    }

    console.log('🗑️ Deleting invoice:', { id });

    await getSql()`DELETE FROM invoices WHERE id = ${id}`;

    console.log('✅ Invoice deleted successfully');
  } catch (error) {
    console.error('❌ Database Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(errorMessage.includes('POSTGRES_URL') || errorMessage.includes('Database unavailable')
      ? errorMessage
      : 'Failed to delete invoice.');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
