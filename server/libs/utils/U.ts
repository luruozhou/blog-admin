export async function wait(time: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, time));
}