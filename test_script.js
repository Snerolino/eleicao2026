import { sanitizeUrl } from './src/utils/sanitizeUrl.ts';
console.log(sanitizeUrl('javascript:alert(1)'));
console.log(sanitizeUrl('http://example.com'));
