import { Box } from '@ui';

export interface PageContentSectionProps {
  title: string;
  body: string;
}

export function PageContentSection({ title, body }: PageContentSectionProps) {
  return (
    <Box className="page-section">
      <h1 className="page-title">{title}</h1>
      <p className="page-body">{body}</p>
    </Box>
  );
}
