/**
 * Removes the /dev verification harness from the static export.
 *
 * The harness pages guard themselves with notFound() in production, but Next
 * still emits a route directory for them. This deletes it outright so nothing
 * under /dev ever reaches the client's host.
 */
import { rm } from 'node:fs/promises';

const target = new URL('../out/dev/', import.meta.url);
await rm(target, { recursive: true, force: true });
console.log('[build] stripped /dev harness routes from out/');
