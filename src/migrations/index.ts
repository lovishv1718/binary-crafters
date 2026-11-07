import * as migration_20261022_070510_initial from './20261022_070510_initial';
import * as migration_20261029_060706_result_website from './20261029_060706_result_website';
import * as migration_20261031_151522_site_analytics from './20261031_151522_site_analytics';
import * as migration_20261107_073625_roles_access_control from './20261107_073625_roles_access_control';

export const migrations = [
  {
    up: migration_20261022_070510_initial.up,
    down: migration_20261022_070510_initial.down,
    name: '20261022_070510_initial',
  },
  {
    up: migration_20261029_060706_result_website.up,
    down: migration_20261029_060706_result_website.down,
    name: '20261029_060706_result_website',
  },
  {
    up: migration_20261031_151522_site_analytics.up,
    down: migration_20261031_151522_site_analytics.down,
    name: '20261031_151522_site_analytics',
  },
  {
    up: migration_20261107_073625_roles_access_control.up,
    down: migration_20261107_073625_roles_access_control.down,
    name: '20261107_073625_roles_access_control'
  },
];
