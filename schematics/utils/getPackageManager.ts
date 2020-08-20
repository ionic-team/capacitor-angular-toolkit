import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

enum PackageManager {
Npm = 'npm',
Cnpm = 'cnpm',
Yarn = 'yarn',
Pnpm = 'pnpm',
}

function supports(name: string): boolean {
  try {
    execSync(`${name} --version`, { stdio: 'ignore' });

    return true;
  } catch {
    return false;
  }
}

export function supportsYarn(): boolean {
  return supports('yarn');
}

export function supportsNpm(): boolean {
  return supports('npm');
}

export function getPackageManager(root: string): PackageManager {
  let packageManager = PackageManager.Npm;

  const hasYarn = supportsYarn();
  const hasYarnLock = existsSync(join(root, 'yarn.lock'));
  const hasNpm = supportsNpm();
  const hasNpmLock = existsSync(join(root, 'package-lock.json'));

  if (hasYarn && hasYarnLock && !hasNpmLock) {
    packageManager = PackageManager.Yarn;
  } else if (hasNpm && hasNpmLock && !hasYarnLock) {
    packageManager = PackageManager.Npm;
  } else if (hasYarn && !hasNpm) {
    packageManager = PackageManager.Yarn;
  } else if (hasNpm && !hasYarn) {
    packageManager = PackageManager.Npm;
  }
  return packageManager;
}
