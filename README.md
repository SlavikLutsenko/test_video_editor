# Video Editor

## Installation

1. Clone the repo
   ```sh
   git clone https://github.com/SlavikLutsenko/test_video_editor.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
   or
   ```sh
   yarn
   ```

## Running Project

- To start the local server, use the following command:
  ```sh
   npm run start
  ```
  or
  ```sh
   yarn run start
  ```

## Possible problems

The current implementation uses the free Сloudinary plan. If the download button stopped working in the application, please change the Cloudinary cloud name (`REACT_APP_CLOUDINARY_CLOUD_NAME`) in the `.env` file.
