using File = TagLib.File;

public class StreamFileAbstraction : File.IFileAbstraction
{
    public StreamFileAbstraction(string name, Stream readStream, Stream? writeStream = null)
    {
        Name        = name;
        ReadStream  = readStream;
        WriteStream = writeStream;
    }

    public string Name { get; }
    public Stream ReadStream { get; }
    public Stream? WriteStream { get; }

    public void CloseStream(Stream stream)
    {
    }
}