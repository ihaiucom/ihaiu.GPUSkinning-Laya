public class LittleEndianBitConverter
{


    public static byte[] GetBytes(short value)
    {
        return new byte[] { (byte)value, (byte)(value >> 8) };
    }

    public static byte[] GetBytes(int value)
    {
        return new byte[] { (byte)value, (byte)(value >> 8), (byte)(value >> 16), (byte)(value >> 24) };
    }

    public static byte[] GetBytes(long value)
    {
        return new byte[] {
                (byte)value, (byte)(value >> 8), (byte)(value >> 16), (byte)(value >> 24),
                (byte)(value >> 32), (byte)(value >> 40), (byte)(value >> 48), (byte)(value >> 56)
            };
    }

    public static short ToInt16(byte[] value, int startIndex)
    {

        return (short)((value[startIndex]) | (value[startIndex + 1] << 8));
    }

    public static int ToInt32(byte[] value, int startIndex)
    {

        return (value[startIndex]) | (value[startIndex + 1] << 8) | (value[startIndex + 2] << 16) | (value[startIndex + 3] << 24);
    }

    public static long ToInt64(byte[] value, int startIndex)
    {

        int lowBytes = (value[startIndex]) | (value[startIndex + 1] << 8) | (value[startIndex + 2] << 16) | (value[startIndex + 3] << 24);
        int highBytes = (value[startIndex + 4]) | (value[startIndex + 5] << 8) | (value[startIndex + 6] << 16) | (value[startIndex + 7] << 24);
        return ((uint)lowBytes | ((long)highBytes << 32));
    }
}