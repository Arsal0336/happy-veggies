import { useQuery } from '@tanstack/react-query';
import { suggestionService } from '../services/suggestionService';

export const useSuggestions = () =>
  useQuery({ queryKey: ['suggestions'], queryFn: suggestionService.getSuggestions });
