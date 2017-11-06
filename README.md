# google-drive-cleaner
A tool to remove files on Google Drive.

## install
```
% npm install @abetomo/google-drive-cleaner
```

## dryrun
### example
* Owner is `GMAIL_ADDRESS`
* File name contains `.xlsx`

```
% google-drive-cleaner \
-a AUTH_JSON_FILE_PATH \
-q "'GMAIL_ADDRESS' in owners and name contains '.xlsx'"
```

Because it is dryrun, the file to be deleted is only displayed.

### query
See [Search for Files and Team Drives](https://developers.google.com/drive/v3/web/search-parameters) for queries specified with `-q`.


## delete
Add `--no-dryrun` option.

### example
* Owner is `GMAIL_ADDRESS`
* File name contains `.xlsx`

```
% google-drive-cleaner \
-a AUTH_JSON_FILE_PATH \
-q "'GMAIL_ADDRESS' in owners and name contains '.xlsx'" \
--no-dryrun
```

By adding the `--no-dryrun` option, the files on the drive are deleted.

## Usage example of Node.js API
```javascript
'use strict'

const GoogleDriveCleaner = require('@abetomo/google-drive-cleaner')

(new GoogleDriveCleaner('AUTH_JSON_FILE_PATH')).clean({
  query: 'Query string for searching delete files.',
  dryrun: true
})
```
