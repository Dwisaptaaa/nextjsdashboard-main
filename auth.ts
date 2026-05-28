import NextAuth from 'next-auth';

// Pass a function to NextAuth for lazy config evaluation. This prevents
// heavy native modules from being imported during middleware bundling.
export const { handlers, auth } = NextAuth(async (req) => {
	const cfg = await import('./auth.config');
	return cfg.getAuthConfig();
});
