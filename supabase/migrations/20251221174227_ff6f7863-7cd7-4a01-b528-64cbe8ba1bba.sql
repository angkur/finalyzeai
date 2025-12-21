-- Add policy to allow users to delete their own interactions
CREATE POLICY "Users can delete their own interactions" 
ON public.interactions 
FOR DELETE 
USING (auth.uid() = user_id);