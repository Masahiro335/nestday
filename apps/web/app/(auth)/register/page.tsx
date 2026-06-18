import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return <RegisterForm redirectTo={searchParams.redirect} />;
}
