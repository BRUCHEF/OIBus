# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.3.4](https://github.com/OptimistikSAS/OIBus/compare/v2.3.3...v2.3.4) (2022-10-28)


### Bug Fixes

* **cache:** improve perf on values query in sqlite cache ([51e8f9a](https://github.com/OptimistikSAS/OIBus/commit/51e8f9aa0f2aa344fcf5202f5b68ecbf3d7fcb5c))
* **setup:** improve setup ([9ad71fe](https://github.com/OptimistikSAS/OIBus/commit/9ad71febb62b726b57411d245faa8d46eac4584d))

### [2.3.3](https://github.com/OptimistikSAS/OIBus/compare/v2.3.2...v2.3.3) (2022-10-25)


### Bug Fixes

* **http-request:** fix readStream close on http error ([821f951](https://github.com/OptimistikSAS/OIBus/commit/821f9518e7dc1d6bbe44617afa22a726c1a3b629))
* **north:** fix file cache stat eperm error ([91ac4fc](https://github.com/OptimistikSAS/OIBus/commit/91ac4fc86ef2934ce1527aa3542301ef3050a004))

### [2.3.2](https://github.com/OptimistikSAS/OIBus/compare/v2.3.1...v2.3.2) (2022-10-21)


### Bug Fixes

* **north:** fix north retrieve file when file being written ([f0c8117](https://github.com/OptimistikSAS/OIBus/commit/f0c81172b627eb7f14f6b46cbe2436c1291b0017))

### [2.3.1](https://github.com/OptimistikSAS/OIBus/compare/v2.3.0...v2.3.1) (2022-10-21)


### Bug Fixes

* **archive:** fix form validation for archive retention duration and http retry count ([3442882](https://github.com/OptimistikSAS/OIBus/commit/344288250fe55f75cda8fd2481eece26fd352d58))

## [2.3.0](https://github.com/OptimistikSAS/OIBus/compare/v2.2.2...v2.3.0) (2022-10-21)


### Features

* **cache:** File cache uses folder scan to get file list instead of DB ([62f3d0b](https://github.com/OptimistikSAS/OIBus/commit/62f3d0bf064fffafcdb215c87d76e008fa29a504))
* **cache:** Remove old file cache DBs ([7fec671](https://github.com/OptimistikSAS/OIBus/commit/7fec671085fb8c2b2b5190f248a808b234b62e14))


### Bug Fixes

* **cache:** Add tests for file and value caches ([5858f26](https://github.com/OptimistikSAS/OIBus/commit/5858f269c6d9ecab52415e99ea6ca20e5a80c56f))
* **cache:** Fix retrieving file from cache ([eb6e3fd](https://github.com/OptimistikSAS/OIBus/commit/eb6e3fd0f7f450237e5db32296eec55e2a3f974a))
* **ui:** History date time input fix ([49320a8](https://github.com/OptimistikSAS/OIBus/commit/49320a80cb5bc119bd0a844f29ce486f38db6d49))

### [2.2.2](https://github.com/OptimistikSAS/OIBus/compare/v2.2.1...v2.2.2) (2022-10-19)


### Bug Fixes

* **north:** switch HTTP request error from Promise reject to Error thrown ([baf9c1a](https://github.com/OptimistikSAS/OIBus/commit/baf9c1a3a689393e1a9aca1b817eac492a8473c3))
* **south:** reinitialize properly south currently on scan after error ([637dcc5](https://github.com/OptimistikSAS/OIBus/commit/637dcc544f9e6f1e7f20f34094211028955827c6))

### [2.2.1](https://github.com/OptimistikSAS/OIBus/compare/v2.2.0...v2.2.1) (2022-10-18)


### Bug Fixes

* **front:** refactor datasource/protocol into south/southType and application/api into north/northType ([74e789f](https://github.com/OptimistikSAS/OIBus/commit/74e789f1eccb5fb334fe918ff20c910cfe035aaf))

## [2.2.0](https://github.com/OptimistikSAS/OIBus/compare/v2.1.2...v2.2.0) (2022-10-18)


### Features

* **cache:** refactor the cache ([fca1ae4](https://github.com/OptimistikSAS/OIBus/commit/fca1ae488a6b59885b3f728ebc0392baf31daedd))
* **installer:** sign Windows installer with sign tool ([481b619](https://github.com/OptimistikSAS/OIBus/commit/481b6199d3e62ad4888611ff43a4a0cfba989525))
* **logs:** create paginated logs database query ([52e46be](https://github.com/OptimistikSAS/OIBus/commit/52e46be2f3a26d60ae0f871a7a8277753d2cb284))
* **logs:** standard log path in oibus folder ([4e24752](https://github.com/OptimistikSAS/OIBus/commit/4e2475242e5ce85a3aa88c999fa9ee8cb026bd41))
* **north:** specific cache folders for each connector ([fb91f83](https://github.com/OptimistikSAS/OIBus/commit/fb91f8355ba8b9e154ff49f32522c88701262c1d))


### Bug Fixes

* **cache:** add group count for values caching ([64deb5f](https://github.com/OptimistikSAS/OIBus/commit/64deb5fb578f386c27e209ab11a5f4f047e35b5c))
* **cache:** clean up and move cache files ([531e752](https://github.com/OptimistikSAS/OIBus/commit/531e75276f06696d05b8928c2754585548c38291))
* **config:** refactor config service ([7233dc4](https://github.com/OptimistikSAS/OIBus/commit/7233dc4735ce95ff6f052b5cbba56a53a0cf1814))
* **encryption:** refactor encryption with fs/promises and improve testing ([940aa39](https://github.com/OptimistikSAS/OIBus/commit/940aa3925ee4867d6a6c00c4b64013515bb12d4b))
* **history:** add an interval to retrieve history queries to run and fix history query initialisation ([fde01d8](https://github.com/OptimistikSAS/OIBus/commit/fde01d85e0b84e9f49bbc938ac033d98c329cf67))
* **logger:** fix logger type and level ([4e6ce76](https://github.com/OptimistikSAS/OIBus/commit/4e6ce76eb42c9bdda0dc0bbf77ca40150d88082c))
* **migration:** fix logger in migration ([edb5b10](https://github.com/OptimistikSAS/OIBus/commit/edb5b106a419f47c278906112286cf863e6b1d9b))
* **north:** archive disabled by default ([5062806](https://github.com/OptimistikSAS/OIBus/commit/5062806e999a736ed245fc432061fa3c91f3f37b))
* **north:** fix North retry error and catch init/connect error ([a8dca57](https://github.com/OptimistikSAS/OIBus/commit/a8dca57e93cb9daa3524c915f0925276331e7677))
* **oibus:** refactor code to harmonize connectors and live status ([2bde86f](https://github.com/OptimistikSAS/OIBus/commit/2bde86f59398a1333b5acf584a5f1c1aa392e063))
* **south:** fix South doc and tests ([b0fe496](https://github.com/OptimistikSAS/OIBus/commit/b0fe496883d25f7f080a034309b367aadde70dae))
* **sql:** fix sql integration test ([d587023](https://github.com/OptimistikSAS/OIBus/commit/d58702319cb1f800757488a12d1bcf2abc0182ea))
* **tests:** improve tests coverage and fix Modbus utils tools ([0580bbe](https://github.com/OptimistikSAS/OIBus/commit/0580bbe2fc4cecd9337a1bfd3c3c730d868f6c64))
* **ui:** 1807 solved button display problem when renaming connector ([369f913](https://github.com/OptimistikSAS/OIBus/commit/369f91338d7c1e3fbd0fe0cbe99c06e54bebed13))
* **ui:** align save button with edit field ([c6ef14b](https://github.com/OptimistikSAS/OIBus/commit/c6ef14b7834a2408e108dc8e434c82e0ab414d9f))
* **ui:** Disable ui connection to disabled north and south nodes ([b396b32](https://github.com/OptimistikSAS/OIBus/commit/b396b32bf66e5e095104789d366c936c608db769))

### [2.1.2](https://github.com/OptimistikSAS/OIBus/compare/v2.1.1...v2.1.2) (2022-09-27)


### Bug Fixes

* **logs:** fix loki addLogs engine method with koa ctx ([94ac8c3](https://github.com/OptimistikSAS/OIBus/commit/94ac8c34e74f6b8b4c5f866f5d1110eb1a5ffd4d))

### [2.1.1](https://github.com/OptimistikSAS/OIBus/compare/v2.1.0...v2.1.1) (2022-09-26)


### Bug Fixes

* **health-signal:** log signal when forwarding with disabled http ([c92bdfd](https://github.com/OptimistikSAS/OIBus/commit/c92bdfdf4bf039d7d79ef0c9fdba392d4be8b99f))

## [2.1.0](https://github.com/OptimistikSAS/OIBus/compare/v2.0.6...v2.1.0) (2022-09-09)


### Features

* **sqlite:** only use better-sqlite3 ([ed7c258](https://github.com/OptimistikSAS/OIBus/commit/ed7c2584d1d8a0b2d5eafeea4ecce5b49cbeac99))
* **tests:** add integration test for MySQL, PostgreSQL and MSSQL ([79d783f](https://github.com/OptimistikSAS/OIBus/commit/79d783fc40bd9e00c626cac65d63d31a6d106bb8))


### Bug Fixes

* **ci:** adapt release ci ([362bd20](https://github.com/OptimistikSAS/OIBus/commit/362bd20157819b4df2cf27eef00bfbccb04ed4ac))
* **installer:** do not skip config settings if new install ([29ccdf5](https://github.com/OptimistikSAS/OIBus/commit/29ccdf5da64897ad5b05c7574e1296d3b4e841ce))
* **oia:** adapt OIAnalytics North connector help with the latest API key gen feature [#1820](https://github.com/OptimistikSAS/OIBus/issues/1820) ([d6593f1](https://github.com/OptimistikSAS/OIBus/commit/d6593f1f8b2a952fbecf199e88df24609581af92))
* **opchda:** fix blocking history read and fix [#1411](https://github.com/OptimistikSAS/OIBus/issues/1411) ([633a49d](https://github.com/OptimistikSAS/OIBus/commit/633a49d2001e95cd6a0a9f9c3f8f7871fd4f1ee2))
* **opcua:** fix certificate management and reconnection ; switch to node-opcua-client (lighter) ([fcfe8e7](https://github.com/OptimistikSAS/OIBus/commit/fcfe8e75d6ba5bcbdb9d493e3e4b1d2aecb9e6db))
* **release:** fix release version and improve npm script names ([8d9728c](https://github.com/OptimistikSAS/OIBus/commit/8d9728c9019fee091dbdc6e6cc3c1ac823c2d31c))
* **south-opchda:** fix opchda reconnection ([3bd8181](https://github.com/OptimistikSAS/OIBus/commit/3bd8181031a25e25eae73e8234726ef88159832c))
* **south-sql:** fix sqlite param query with better-sqlite3 ([783e11d](https://github.com/OptimistikSAS/OIBus/commit/783e11d30a7fa954e2e60bc098435b100e9a4e6f))
* **sqlite:** add tests and remove async ([fcc924f](https://github.com/OptimistikSAS/OIBus/commit/fcc924ff373837c324ce427f08bdf894941658bb))
* **status:** rework statusData for live update ([e569611](https://github.com/OptimistikSAS/OIBus/commit/e56961198bf2167d8ca612e630fff7045ab8b619))
* **tests:** reorganise tests with tests config ([8ab9d80](https://github.com/OptimistikSAS/OIBus/commit/8ab9d80959aa2f0b65ac5a11f1a032d991d79302))
* **ui:** fix switch buttons to show up properly and make them default checkbox type [#1805](https://github.com/OptimistikSAS/OIBus/issues/1805) ([e004a52](https://github.com/OptimistikSAS/OIBus/commit/e004a52a1b194183a58181d93c42eead21ae3532))
* **win-setup:** fix permissions issues on OIBus windows update ([0a9e2a4](https://github.com/OptimistikSAS/OIBus/commit/0a9e2a4f645b726f8d5ef5edd6cf908be00671d7))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.