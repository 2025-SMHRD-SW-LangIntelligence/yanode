import type { DriveFolder } from "../hooks/useDriveFolders";
import type { FileItem } from "../../../types";

export function flattenDriveFiles(folders: DriveFolder[]): FileItem[] {
  const result: FileItem[] = [];

  const traverse = (folder: DriveFolder) => {
    if (folder.files) {
      result.push(...folder.files);
    }
    if (folder.folders) {
      folder.folders.forEach(traverse);
    }
  };

  folders.forEach(traverse);
  return result;
}