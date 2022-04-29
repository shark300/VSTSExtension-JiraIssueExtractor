export class Logger {
  banner(title: string): void {
    console.log("==================================================");
    console.log(`\t${title}`);
    console.log("==================================================");
  }

  heading(title: string): void {
    console.log();
    console.log(`> ${title}`);
  }

  log(message: string): void {
    console.log(message);
  }
}
