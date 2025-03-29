import { basename, join } from 'path'
import { store } from '../lib/store'
import { writeFileSync } from 'fs'

export const handleFileCopy = async (_, filePath, buffer): Promise<string> => {
  const fileName = basename(filePath)
  const targetPath = join(store.get('path') as string, fileName)

  writeFileSync(targetPath, buffer)

  return targetPath
}
