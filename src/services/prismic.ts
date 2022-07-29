import * as prismic from '@prismicio/client';
import { HttpRequestLike } from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';

import { apiEndpoint } from '../../sm.json'

export interface PrismicConfig {
  req?: HttpRequestLike;
}

export function getPrismicClient(config: PrismicConfig): prismic.Client {
  const client = prismic.createClient(apiEndpoint);

  enableAutoPreviews({
    client,
    req: config.req,
  })

  return client;
}
