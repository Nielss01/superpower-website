-- Rename builder_profiles → profiles for more abstract usage
ALTER TABLE public.builder_profiles RENAME TO profiles;

-- Rename indexes
ALTER INDEX IF EXISTS builder_profiles_slug_idx RENAME TO profiles_slug_idx;
ALTER INDEX IF EXISTS builder_profiles_user_id_idx RENAME TO profiles_user_id_idx;

-- Rename trigger
DROP TRIGGER IF EXISTS builder_profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Rename RLS policies
ALTER POLICY "Public can view published builder profiles" ON public.profiles
  RENAME TO "Public can view published profiles";

ALTER POLICY "Users can insert their own builder profiles" ON public.profiles
  RENAME TO "Users can insert their own profiles";

ALTER POLICY "Users can update their own builder profiles" ON public.profiles
  RENAME TO "Users can update their own profiles";

ALTER POLICY "Users can delete their own builder profiles" ON public.profiles
  RENAME TO "Users can delete their own profiles";
