import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  chain,
} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';
import { getWorkspace } from '@schematics/angular/utility/workspace';

import { getPackageManager } from '../utils/getPackageManager';

import { addPackageToPackageJson } from './../utils/package';
import { Schema as CapAddOptions } from './schema';

function addCapacitorToPackageJson(): Rule {
  return (host: Tree) => {
    addPackageToPackageJson(host, 'dependencies', '@capacitor/core', 'latest');
    addPackageToPackageJson(
      host,
      'devDependencies',
      '@capacitor/cli',
      'latest'
    );
    return host;
  };
}

function capInit(projectName: string, npmTool: string, webDir: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    const packageInstall = context.addTask(new NodePackageInstallTask());
    const command = npmTool === 'npm' ? 'npx' : 'yarn';
    context.addTask(
      new RunSchematicTask('cap-init', {
        command,
        args: [
          'cap',
          'init',
          projectName,
          '--web-dir',
          webDir,
        ],
      }),
      [packageInstall]
    );
    return host;
  };
}

export default function ngAdd(options: CapAddOptions): Rule {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);

    if (!options.project) {
      options.project = workspace.extensions.defaultProject as string;
    }

    const projectTree = workspace.projects.get(options.project);

    if (projectTree.extensions['projectType'] !== 'application') {
      throw new SchematicsException(
        `Capacitor Add requires a project type of "application".`
      );
    }

    const packageMgm = getPackageManager(projectTree.root);
    const distTarget = projectTree.targets.get('build').options[ 'outputPath' ] as string;

    return chain([
      addCapacitorToPackageJson(),
      capInit(options.project, packageMgm, distTarget),
    ]);
  };
}
