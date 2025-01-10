import { useState, useEffect } from "react";
import "tailwindcss/tailwind.css"; // Importar estilos de Tailwind CSS

function App() {
  const [equipos, setEquipos] = useState([]); // Estado para guardar equipos
  const [numeroSerie, setNumeroSerie] = useState(""); // Estado para el número de serie
  const [excelFile, setExcelFile] = useState(null); // Estado para el archivo Excel
  const [pdfFile, setPdfFile] = useState(null); // Estado para el archivo PDF
  const [filtro, setFiltro] = useState(""); // Estado para el filtro de búsqueda

  // Convertir archivos en cadenas Base64
  const convertirArchivoABase64 = (archivo) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(archivo);
    });
  };

  // Cargar equipos desde localStorage al montar el componente
  useEffect(() => {
    const equiposGuardados = localStorage.getItem("equipos");
    if (equiposGuardados) {
      setEquipos(JSON.parse(equiposGuardados));
    }
  }, []);

  const agregarEquipo = async (e) => {
    e.preventDefault();

    if (!numeroSerie || !excelFile || !pdfFile) {
      alert(
        "Por favor, completa todos los campos y selecciona ambos archivos."
      );
      return;
    }

    try {
      const excelBase64 = await convertirArchivoABase64(excelFile);
      const pdfBase64 = await convertirArchivoABase64(pdfFile);

      const nuevoEquipo = {
        numeroSerie,
        excelFile: excelBase64,
        pdfFile: pdfBase64,
      };

      const nuevosEquipos = [...equipos, nuevoEquipo];
      setEquipos(nuevosEquipos);
      localStorage.setItem("equipos", JSON.stringify(nuevosEquipos));

      setNumeroSerie("");
      setExcelFile(null);
      setPdfFile(null);
    } catch (error) {
      console.error("Error al convertir archivos a Base64:", error);
    }
  };

  const eliminarEquipo = (index) => {
    const nuevosEquipos = equipos.filter((_, i) => i !== index);
    setEquipos(nuevosEquipos);
    localStorage.setItem("equipos", JSON.stringify(nuevosEquipos)); // Actualiza el localStorage
  };

  const actualizarEquipo = async (index) => {
    const numeroSerieActualizado = prompt(
      "Ingresa el nuevo número de serie:",
      equipos[index].numeroSerie
    );
    if (!numeroSerieActualizado) {
      alert("El número de serie es requerido.");
      return;
    }

    try {
      const excelInput = document.createElement("input");
      excelInput.type = "file";
      excelInput.accept = ".xlsx, .xls";
      excelInput.onchange = async () => {
        const nuevoExcelFile = excelInput.files[0]
          ? await convertirArchivoABase64(excelInput.files[0])
          : equipos[index].excelFile;

        const pdfInput = document.createElement("input");
        pdfInput.type = "file";
        pdfInput.accept = ".pdf";
        pdfInput.onchange = async () => {
          const nuevoPdfFile = pdfInput.files[0]
            ? await convertirArchivoABase64(pdfInput.files[0])
            : equipos[index].pdfFile;

          const equiposActualizados = [...equipos];
          equiposActualizados[index] = {
            ...equipos[index],
            numeroSerie: numeroSerieActualizado,
            excelFile: nuevoExcelFile,
            pdfFile: nuevoPdfFile,
          };

          setEquipos(equiposActualizados);
          localStorage.setItem("equipos", JSON.stringify(equiposActualizados));
        };
        pdfInput.click();
      };
      excelInput.click();
    } catch (error) {
      console.error("Error al actualizar el equipo:", error);
    }
  };

  const equiposFiltrados = equipos.filter((equipo) =>
    equipo.numeroSerie.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="font-bold text-lg">EYMSA</div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Buscar..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="px-4 py-2 rounded-md text-white"
          />
          <button className="bg-blue-700 px-4 py-2 rounded-md hover:bg-blue-800">
            Buscar
          </button>
        </div>
      </nav>

      <form
        id="add-equipment-form"
        className="bg-white p-6 mt-4 shadow-md rounded-md"
        onSubmit={agregarEquipo}
      >
        <div className="mb-4">
          <label className="block text-black">Número de Serie:</label>
          <input
            type="text"
            value={numeroSerie}
            onChange={(e) => setNumeroSerie(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-black">Subir archivo Excel:</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setExcelFile(e.target.files[0])}
            className="w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-black">Subir archivo PDF:</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
            className="w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Guardar
        </button>
      </form>

      <table className="table-auto w-full mt-6 bg-white shadow-md rounded-md">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="px-4 py-2">Número de Serie</th>
            <th className="px-4 py-2">Archivo Excel</th>
            <th className="px-4 py-2">Archivo PDF</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equiposFiltrados.map((equipo, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{equipo.numeroSerie}</td>
              <td className="px-4 py-2">
                <a
                  href={equipo.excelFile}
                  download={`Equipo_${equipo.numeroSerie}.xlsx`}
                  className="text-blue-500 hover:underline"
                >
                  Descargar Excel
                </a>
              </td>
              <td className="px-4 py-2">
                <a
                  href={equipo.pdfFile}
                  download={`Equipo_${equipo.numeroSerie}.pdf`}
                  className="text-blue-500 hover:underline"
                >
                  Descargar PDF
                </a>
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => actualizarEquipo(index)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => eliminarEquipo(index)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 ml-2"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
