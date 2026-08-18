import { parse } from 'csv-parse/sync';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CsvRowError } from '../types/csv-error.type';

/**
 * Parses a CSV file, converts each row into a DTO instance,
 * validates it using class-validator, and separates the rows
 * into valid and invalid collections.
 *
 * @template T - The DTO class type to transform each CSV row into.
 *
 * @param buffer - The CSV file as a Node.js Buffer.
 * @param dtoClass - The DTO class used to transform and validate each row.
 *
 * @returns An object containing:
 * - `valid`: Successfully validated DTO instances along with their CSV row number.
 * - `errors`: Validation errors grouped by CSV row.
 *
 * @example
 * const result = await parseAndValidateCsv(
 *   file.buffer,
 *   CreateStudentDto,
 * );
 *
 * console.log(result.valid);
 * console.log(result.errors);
 */
export async function parseAndValidateCsv<T extends object>(
  buffer: Buffer,
  dtoClass: new () => T,
): Promise<{ valid: { row: number; dto: T }[]; errors: CsvRowError[] }> {
  /**
   * Parse the CSV buffer into an array of plain JavaScript objects.
   *
   * Example CSV:
   * ------------------------
   * name,email
   * John,john@gmail.com
   * Mary,mary@gmail.com
   * ------------------------
   *
   * Produces:
   * [
   *   { name: "John", email: "john@gmail.com" },
   *   { name: "Mary", email: "mary@gmail.com" }
   * ]
   */
  const rawRows: Record<string, string>[] = parse(buffer, {
    columns: true, // Use the first row as object keys.
    skip_empty_lines: true, // Ignore empty rows.
    trim: true, // Remove leading/trailing whitespace.
  });

  /**
   * Stores all successfully validated DTOs.
   *
   * Example:
   * [
   *   {
   *     row: 2,
   *     dto: CreateStudentDto {...}
   *   }
   * ]
   */
  const valid: { row: number; dto: T }[] = [];

  /**
   * Stores validation errors for invalid rows.
   *
   * Example:
   * [
   *   {
   *     row: 3,
   *     errors: {
   *       email: ["email must be an email"]
   *     }
   *   }
   * ]
   */
  const errors: CsvRowError[] = [];

  /**
   * Process every parsed CSV row.
   */
  for (const [index, rawRow] of rawRows.entries()) {
    /**
     * Convert the plain JavaScript object into a DTO instance.
     *
     * This allows class-validator decorators to work.
     */
    const dto = plainToInstance(dtoClass, rawRow);

    /**
     * Validate the DTO against all class-validator decorators.
     *
     * Example decorators:
     * @IsEmail()
     * @IsNotEmpty()
     * @MinLength()
     */
    const validationErrors = await validate(dto as object);

    /**
     * Calculate the actual CSV row number.
     *
     * +2 because:
     * - CSV row numbering starts at 1.
     * - The first row is the header.
     *
     * index = 0  -> CSV row 2
     * index = 1  -> CSV row 3
     */
    const row = index + 2;

    /**
     * If validation failed, transform the ValidationError[]
     * into a simpler object grouped by field name.
     */
    if (validationErrors.length > 0) {
      /**
       * Example input:
       *
       * [
       *   {
       *     property: "email",
       *     constraints: {
       *       isEmail: "email must be an email"
       *     }
       *   }
       * ]
       *
       * Output:
       *
       * {
       *   email: [
       *     "email must be an email"
       *   ]
       * }
       */
      const fieldErrors = validationErrors.reduce<Record<string, string[]>>(
        /**
         * Build an object whose keys are field names
         * and whose values are arrays of validation messages.
         */
        (acc, err) => {
          /**
           * err.property
           * Example:
           * "email"
           */

          /**
           * err.constraints
           * Example:
           * {
           *   isEmail: "email must be an email"
           * }
           */

          /**
           * Object.values() extracts only the messages:
           *
           * [
           *   "email must be an email"
           * ]
           */
          acc[err.property] = Object.values(err.constraints ?? {});

          /**
           * Return the accumulator so the next iteration
           * continues building the object.
           */
          return acc;
        },
        /**
         * Start with an empty object.
         */
        {},
      );

      /**
       * Store the validation errors for this CSV row.
       */
      errors.push({
        row,
        errors: fieldErrors,
      });

      /**
       * Skip adding this row to the valid collection.
       */
      continue;
    }

    /**
     * Validation passed.
     *
     * Store the DTO together with its CSV row number.
     */
    valid.push({
      row,
      dto,
    });
  }

  /**
   * Return both successful and failed rows.
   */
  return {
    valid,
    errors,
  };
}
