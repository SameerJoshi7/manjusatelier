import { validationResult } from 'express-validator';
import { ApiError } from './error.js';

/** Collect express-validator results and throw on failure. */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array().map((e) => e.msg).join(', '));
  }
  next();
}
