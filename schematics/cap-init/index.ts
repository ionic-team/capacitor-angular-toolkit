import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { spawn } from 'child_process';
import { Observable } from 'rxjs';

export default function({ command, args }: { command: string; args: string[]; }) {
  return (host: Tree, _context: SchematicContext) => {
    return new Observable<Tree>(subscriber => {
      const cp = spawn(command, args, { stdio: 'inherit' });
      cp.on('error', error => {
        subscriber.error(error);
      });
      cp.on('close', () => {
        subscriber.next(host);
        subscriber.complete();
      });
      return () => {
        cp.kill();
        return host;
      };
    });
  };
}
