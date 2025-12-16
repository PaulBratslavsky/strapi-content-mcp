import type { Core } from '@strapi/strapi';
import { validateToolInput } from '../schemas';

export const uploadMediaTool = {
  name: 'upload_media',
  description: 'Upload a media file from a URL to the Strapi media library. This is a write operation.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: {
        type: 'string',
        description: 'URL of the file to upload',
      },
      name: {
        type: 'string',
        description: 'Custom filename (optional, defaults to filename from URL)',
      },
      caption: {
        type: 'string',
        description: 'Caption for the media file',
      },
      alternativeText: {
        type: 'string',
        description: 'Alternative text for accessibility',
      },
    },
    required: ['url'],
  },
};

export async function handleUploadMedia(strapi: Core.Strapi, args: unknown) {
  const validatedArgs = validateToolInput('upload_media', args);
  const { url, name, caption, alternativeText } = validatedArgs;

  const mediaService = strapi.plugin('strapi-content-mcp').service('media');

  const uploadedFiles = await mediaService.uploadFromUrl(url, {
    name,
    caption,
    alternativeText,
  });

  const file = uploadedFiles[0];

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            success: true,
            data: file,
            message: 'File uploaded successfully',
            usage: {
              tip: 'Use the id or documentId to link this media to a content entry',
              example: `update with data: { image: ${file.id} }`,
            },
          },
          null,
          2
        ),
      },
    ],
  };
}
