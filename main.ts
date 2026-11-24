// tiny-stack-vm — round 1, written natively in this session
// A small stack virtual machine: PUSH, POP, ADD, SUB, MUL, DIV, HLT.
// Runs under Node 22, no install, stdlib only.

export interface Program {
  code: Uint8Array;
}

export const OP = {
  PUSH: 0x01,
  POP: 0x02,
  ADD: 0x03,
  SUB: 0x04,
  MUL: 0x05,
  DIV: 0x06,
  HLT: 0x07,
} as const;

type Opcode = (typeof OP)[keyof typeof OP];

export class VM {
  private ip = 0;
  private stack: number[] = [];
  private halted = false;
  private trace: string[] = [];

  step(code: Uint8Array): boolean {
    if (this.halted || this.ip >= code.length) return false;
    const op = code[this.ip++] as Opcode;
    switch (op) {
      case OP.PUSH: {
        const v = code[this.ip++];
        this.stack.push(v);
        this.trace.push(`PUSH ${v}`);
        break;
      }
      case OP.POP: {
        const v = this.stack.pop();
        this.trace.push(`POP ${v}`);
        break;
      }
      case OP.ADD: {
        const b = this.stack.pop()!;
        const a = this.stack.pop()!;
        this.stack.push(a + b);
        this.trace.push(`ADD ${a}+${b}=${a + b}`);
        break;
      }
      case OP.SUB: {
        const b = this.stack.pop()!;
        const a = this.stack.pop()!;
        this.stack.push(a - b);
        this.trace.push(`SUB ${a}-${b}=${a - b}`);
        break;
      }
      case OP.MUL: {
        const b = this.stack.pop()!;
        const a = this.stack.pop()!;
        this.stack.push(a * b);
        this.trace.push(`MUL ${a}*${b}=${a * b}`);
        break;
      }
      case OP.DIV: {
        const b = this.stack.pop()!;
        const a = this.stack.pop()!;
        this.stack.push(Math.trunc(a / b));
        this.trace.push(`DIV ${a}/${b}=${Math.trunc(a / b)}`);
        break;
      }
      case OP.HLT:
        this.halted = true;
        this.trace.push('HLT');
        return false;
      default:
        throw new Error(`unknown opcode 0x${op.toString(16)} at ip ${this.ip - 1}`);
    }
    return true;
  }

  run(code: Uint8Array): number[] {
    while (this.step(code)) {}
    return [...this.stack];
  }

  getTrace(): string[] {
    return [...this.trace];
  }
}

if (import.meta.url === process.argv[1]) {
  // example program: PUSH 3, PUSH 4, MUL, PUSH 2, ADD, HLT => 3*4+2 = 14
  const code = new Uint8Array([
    OP.PUSH, 3,
    OP.PUSH, 4,
    OP.MUL,
    OP.PUSH, 2,
    OP.ADD,
    OP.HLT,
  ]);
  const vm = new VM();
  const result = vm.run(code);
  console.log('stack:', result);
  console.log('trace:', vm.getTrace().join(' | '));
}
