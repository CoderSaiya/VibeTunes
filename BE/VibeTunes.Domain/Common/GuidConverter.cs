namespace VibeTunes.Domain.Common;

public static class GuidConverter
{
    public static float ToFloat(Guid guid)
    {
        var bytes = guid.ToByteArray();
        var intVal = BitConverter.ToInt32(bytes, 0);
        return Math.Abs((float)intVal);
    }
}