declare const Omise: {
  configure: (publicKey: string) => void;
  createToken: (
    type: string,
    options: any,
    callback: (statusCode: number, response: any) => void
  ) => void;
  createSource: (
    type: string,
    options: any,
    callback: (statusCode: number, response: any) => void
  ) => void;
}; 