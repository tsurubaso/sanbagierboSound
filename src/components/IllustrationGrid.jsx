function IllustrationsGrid() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await window.electronAPI.getIllustrations();
      setItems(data);
    };
    load();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
      {items.map((img) => (
        <div
          key={img.id}
          className="rounded-xl overflow-hidden border hover:scale-105 transition"
        >
          <iframe
            src={img.src}
            className="w-full h-[300px]"
            sandbox="allow-scripts"
          />
          <div className="p-2 text-sm">
            {img.bookTitle}
          </div>
        </div>
      ))}
    </div>
  );
}