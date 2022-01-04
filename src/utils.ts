export class Utils {

  /**
   * https://gist.github.com/6174/6062387#gistcomment-2993079
   */
  static randomString(length: number = 48) {
    const allCapsAlpha = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]; 
    const allLowerAlpha = [..."abcdefghijklmnopqrstuvwxyz"]; 
    const allUniqueChars = [..."-._~+/"];
    const allNumbers = [..."0123456789"];
    const base = [...allCapsAlpha, ...allNumbers, ...allLowerAlpha, ...allUniqueChars];

    return [...Array(length)].map(i => base[Math.random() * base.length | 0]).join('');
  }

}
