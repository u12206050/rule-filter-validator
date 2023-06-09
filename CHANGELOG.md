# 1.5.3

  - Fix validation issue when payload is a proxy.
  - Added tests to take into account a proxy payload

# 1.5.2

  - Fix esm issue with imports needing explicit file extensions

# 1.5.0

  - Add field functions `year(), month()` etc to allow altering payload values before validating them against the filter
  - Add support for functions on `$NOW()` such as `$NOW(-1 year).year`
  - Add `isValidPayload` as shorthand for `validatePayload(filter, payload).length === 0`

# 1.4.0

  - Add esm module build

# 1.3.1

  - Update `_contains` and `_ncontains` to test if scope field is array and if so, test if any of the values in the array match the filter value

# 1.3.0

  - Add `_$` to allow for validating rules against an array of objects, such that if any object in the array passes the rule, the rule is considered valid.

# 1.2.3

 - Rework `extractFieldFromFilter` to return without the extracted field key

# 1.2.2

 - Fix `extractFieldFromFilter` and add tests for it

# 1.2.1

### Added utility functions
 - `removeFieldFromFilter` Recursivly remove a certain field from a filter
 - `extractFieldFromFilter` Recursivly extract a certain field from a filter
 - `invertFilter` Return a new filter that is the inverse of the original filter

# 1.2.0

 - Pretty errors.
 - Allow string compare on `gt`, `gte`, `lt`, `lte` and `between` operands

# 1.1.3

 - Fix _between to be inclusive
 - Fix support for testing dates using _between

# 1.1.2

 - Automatically call parseFilter within validatePayload.
   - Add the payload as part of the scope allowing for writing filters that can use `$SCOPE.property_on_payload` as a test value

# 1.1.1

 - Add strict mode. See Readme
 - **Breaking** Tests by default are now type and case INSENSITIVE. If you were dependant on it enable strict mode.

# 1.0.8

 - Fix `_or` to swallow errors and return only one error if not valid rule is found

# 1.0.7

 - Fix `_in` and `_nin` when trying to check integers. Now always check as string.


# 1.0.6

 - Add commonjs build for nodejs support