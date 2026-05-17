import postgres from 'postgres';
import {
  CustomerField,
  CustomersTableType,
  FormattedCustomersTable,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import {
  customers as placeholderCustomers,
  invoices as placeholderInvoices,
  revenue as placeholderRevenue,
} from './placeholder-data';

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

function getInvoiceId(index: number) {
  return `invoice-${index + 1}`;
}

export async function fetchRevenue(): Promise<Revenue[]> {
  try {
    if (!isDatabaseAvailable(sql)) {
      return placeholderRevenue;
    }

    // Artificially delay a response for demo purposes.
    // Don't do this in production :)
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await getSql()<Revenue[]>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices(): Promise<LatestInvoice[]> {
  try {
    if (!isDatabaseAvailable(sql)) {
      return placeholderInvoices
        .map((invoice, index) => ({
          id: getInvoiceId(index),
          amount: invoice.amount,
          status: invoice.status as 'paid' | 'pending',
          date: invoice.date,
          customer_id: invoice.customer_id,
          name: placeholderCustomers.find((customer) => customer.id === invoice.customer_id)
            ?.name ?? 'Unknown',
          email: placeholderCustomers.find((customer) => customer.id === invoice.customer_id)
            ?.email ?? 'unknown@example.com',
          image_url: placeholderCustomers.find((customer) => customer.id === invoice.customer_id)
            ?.image_url ?? '/customers/default.png',
        }))
        .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
        .slice(0, 5)
        .map((invoice) => ({
          ...invoice,
          amount: formatCurrency(invoice.amount),
        }));
    }

    const data = await getSql()<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice: LatestInvoiceRaw) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData(): Promise<{
  numberOfCustomers: number;
  numberOfInvoices: number;
  totalPaidInvoices: string;
  totalPendingInvoices: string;
}> {
  try {
    if (!isDatabaseAvailable(sql)) {
      const numberOfInvoices = placeholderInvoices.length;
      const numberOfCustomers = placeholderCustomers.length;
      const paidAmount = placeholderInvoices
        .filter((invoice) => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      const pendingAmount = placeholderInvoices
        .filter((invoice) => invoice.status === 'pending')
        .reduce((sum, invoice) => sum + invoice.amount, 0);

      return {
        numberOfCustomers,
        numberOfInvoices,
        totalPaidInvoices: formatCurrency(paidAmount),
        totalPendingInvoices: formatCurrency(pendingAmount),
      };
    }

    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = getSql()`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = getSql()`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = getSql()`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfCustomers = Number(data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
): Promise<InvoicesTable[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    if (!isDatabaseAvailable(sql)) {
      const normalizedQuery = query.toLowerCase();
      const filteredInvoices = placeholderInvoices
        .map((invoice, index) => ({
          ...invoice,
          id: getInvoiceId(index),
          name: placeholderCustomers.find((customer) => customer.id === invoice.customer_id)
            ?.name ?? 'Unknown',
          email: placeholderCustomers.find((customer) => customer.id === invoice.customer_id)
            ?.email ?? 'unknown@example.com',
          image_url: placeholderCustomers.find((customer) => customer.id === invoice.customer_id)
            ?.image_url ?? '/customers/default.png',
          status: invoice.status as 'paid' | 'pending',
        }))
        .filter((invoice) => {
          return (
            invoice.name.toLowerCase().includes(normalizedQuery) ||
            invoice.email.toLowerCase().includes(normalizedQuery) ||
            invoice.amount.toString().includes(normalizedQuery) ||
            invoice.date.toLowerCase().includes(normalizedQuery) ||
            invoice.status.toLowerCase().includes(normalizedQuery)
          );
        })
        .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));

      return filteredInvoices.slice(offset, offset + ITEMS_PER_PAGE);
    }

    const invoices = await getSql()<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string): Promise<number> {
  try {
    if (!isDatabaseAvailable(sql)) {
      const normalizedQuery = query.toLowerCase();
      const filteredCount = placeholderInvoices.filter((invoice) => {
        const customer = placeholderCustomers.find((customer) => customer.id === invoice.customer_id);
        const name = customer?.name.toLowerCase() ?? '';
        const email = customer?.email.toLowerCase() ?? '';

        return (
          name.includes(normalizedQuery) ||
          email.includes(normalizedQuery) ||
          invoice.amount.toString().includes(normalizedQuery) ||
          invoice.date.toLowerCase().includes(normalizedQuery) ||
          invoice.status.toLowerCase().includes(normalizedQuery)
        );
      }).length;

      return Math.ceil(filteredCount / ITEMS_PER_PAGE);
    }

    const data = await getSql()`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string): Promise<InvoiceForm | undefined> {
  try {
    if (!isDatabaseAvailable(sql)) {
      const invoice = placeholderInvoices
        .map((invoice, index) => ({
          ...invoice,
          id: getInvoiceId(index),
          status: invoice.status as 'paid' | 'pending',
        }))
        .find((invoice) => invoice.id === id);

      return invoice;
    }

    const data = await getSql()<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice: InvoiceForm) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers(): Promise<CustomerField[]> {
  try {
    if (!isDatabaseAvailable(sql)) {
      return placeholderCustomers.map((customer) => ({
        id: customer.id,
        name: customer.name,
      }));
    }

    const customersData = await getSql()<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return customersData;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string): Promise<FormattedCustomersTable[]> {
  try {
    if (!isDatabaseAvailable(sql)) {
      const normalizedQuery = query.toLowerCase();
      const customersWithInvoices = placeholderCustomers.map((customer) => {
        const customerInvoices = placeholderInvoices.filter(
          (invoice) => invoice.customer_id === customer.id,
        );
        const total_pending = customerInvoices
          .filter((invoice) => invoice.status === 'pending')
          .reduce((sum, invoice) => sum + invoice.amount, 0);
        const total_paid = customerInvoices
          .filter((invoice) => invoice.status === 'paid')
          .reduce((sum, invoice) => sum + invoice.amount, 0);

        return {
          ...customer,
          total_invoices: customerInvoices.length,
          total_pending: formatCurrency(total_pending),
          total_paid: formatCurrency(total_paid),
        };
      });

      return customersWithInvoices.filter((customer) => {
        return (
          customer.name.toLowerCase().includes(normalizedQuery) ||
          customer.email.toLowerCase().includes(normalizedQuery)
        );
      });
    }

    const data = await getSql()<CustomersTableType[]>`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC
    `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
