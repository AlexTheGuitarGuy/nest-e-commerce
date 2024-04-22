import { Logger } from '@nestjs/common';
import { Observable, isObservable, tap } from 'rxjs';
import { isPromise } from 'util/types';

import { DecorateAll } from './decorate-all.decorator';

interface Metadata {
  startingTime: number;
  context: `${string}::${string}`;
}

async function logPromise(
  result: Promise<unknown>,
  { context, startingTime }: Metadata,
) {
  try {
    const data = await result;
    const endingTime = performance.now();
    const elapsedTime = endingTime - startingTime;
    Logger.log(
      `[Finish] => ${JSON.stringify({
        endingTime,
        elapsedTime: elapsedTime.toFixed(2),
      })}`,
      context,
    );
    Logger.debug(
      `[Finish] => ${JSON.stringify({
        result: data,
      })}`,
      context,
    );
  } catch (error) {
    const endingTime = performance.now();
    const elapsedTime = endingTime - startingTime;
    Logger.error(
      `[Error] => ${JSON.stringify({
        error,
        elapsedTime: elapsedTime.toFixed(2),
      })}`,
      error,
      context,
    );
  }
}

function logObservable(
  source$: Observable<unknown>,
  { context, startingTime }: Metadata,
) {
  return source$.pipe(
    tap({
      next: (value) => {
        const endingTime = performance.now();
        const elapsedTime = endingTime - startingTime;
        Logger.log(
          `[Finish] => ${JSON.stringify({
            endingTime,
            elapsedTime: elapsedTime.toFixed(2),
          })}`,
          context,
        );
        Logger.debug(
          `[Finish] => ${JSON.stringify({
            result: value,
          })}`,
          context,
        );
      },
      error: (error: Error) => {
        const endingTime = performance.now();
        const elapsedTime = endingTime - startingTime;
        Logger.error(
          `[Error] => ${JSON.stringify({
            error,
            elapsedTime: elapsedTime.toFixed(2),
          })}`,
          error.stack,
          context,
        );
      },
    }),
  );
}

function logResult(result: unknown, metadata: Metadata) {
  if (isPromise(result)) {
    return logPromise(result, metadata);
  }
  if (isObservable(result)) {
    return logObservable(result, metadata);
  }
  const endingTime = performance.now();
  const elapsedTime = endingTime - metadata.startingTime;
  Logger.log(
    `[Finish] => ${JSON.stringify({ endingTime, elapsedTime })}`,
    metadata.context,
  );
  Logger.debug(
    `[Finish] => ${JSON.stringify({
      result,
    })}`,
    metadata.context,
  );

  return metadata;
}

function LoggingInterceptor(
  target: object,
  method: string | symbol,
  descriptor: PropertyDescriptor,
) {
  let service = target.constructor.name;
  if (typeof target === 'function') {
    service = target.name;
  }
  const context: Metadata['context'] = `${service}::${method.toString()}`;
  const originalMethod = descriptor.value as Function;

  descriptor.value = function (...args: unknown[]) {
    const startingTime = performance.now();
    let result: unknown;
    Logger.log(`[Start] => ${JSON.stringify({ startingTime })}`, context);
    Logger.debug(`[Start] => ${JSON.stringify({ args })}`, context);
    try {
      result = originalMethod.apply(this, args);
      result = logResult(result, {
        context,
        startingTime,
      });
    } catch (error: unknown) {
      const endingTime = performance.now();
      const elapsedTime = endingTime - startingTime;
      Logger.error(
        `[Error] => ${JSON.stringify({ error, elapsedTime })}`,
        context,
      );
      throw error;
    }

    return result;
  };

  return descriptor;
}

export function LogMethod(): MethodDecorator {
  return LoggingInterceptor;
}

export function LogMethods(): ClassDecorator {
  return DecorateAll(LogMethod());
}
