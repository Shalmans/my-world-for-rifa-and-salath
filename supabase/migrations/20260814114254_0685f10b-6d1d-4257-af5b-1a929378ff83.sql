CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE TABLE public.birthday_quiz_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Rifa',
  answers jsonb NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.birthday_quiz_submissions TO anon, authenticated;
GRANT SELECT, DELETE ON public.birthday_quiz_submissions TO authenticated;
GRANT ALL ON public.birthday_quiz_submissions TO service_role;
ALTER TABLE public.birthday_quiz_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit answers"
ON public.birthday_quiz_submissions FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read submissions"
ON public.birthday_quiz_submissions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete submissions"
ON public.birthday_quiz_submissions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));