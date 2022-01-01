# 1.1.1

 - Add strict mode. See Readme
 - **Breaking** Tests by default are now type and case INSENSITIVE. If you were dependant on it enable strict mode.

# 1.0.8

 - Fix `_or` to swallow errors and return only one error if not valid rule is found

# 1.0.7

 - Fix `_in` and `_nin` when trying to check integers. Now always check as string.


# 1.0.6

 - Add commonjs build for nodejs support