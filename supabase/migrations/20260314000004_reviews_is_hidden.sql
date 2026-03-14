-- Add soft-hide flag to reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

-- Update the public SELECT policy so hidden reviews are invisible to non-service-role clients
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

CREATE POLICY "Anyone can view non-hidden reviews"
  ON public.reviews FOR SELECT
  USING (is_hidden = false);
