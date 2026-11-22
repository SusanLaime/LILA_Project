// =====================================================================
// RepositorioUsuarios.js — Contrato (interfaz) para guardar y buscar usuarios.
// JavaScript no tiene "interface": cada método lanza error hasta que una
// clase concreta (por ejemplo, RepositorioUsuariosSqlite) lo implemente.
// =====================================================================

export class RepositorioUsuarios {
  // Devuelve un Usuario completo (con roles y perfiles) o null.
  buscarPorId(id) { throw new Error('No implementado'); }

  // Devuelve un Usuario completo (con roles y perfiles) o null.
  buscarPorCi(ci) { throw new Error('No implementado'); }

  // true si ya hay una cuenta con ese CI o ese teléfono.
  existe(ci, telefono) { throw new Error('No implementado'); }

  // Sin id: crea el usuario (INSERT). Con id: guarda sus perfiles y roles nuevos.
  // Si el CI o el teléfono se repiten, lanza un error con { codigo: 'DUPLICADO' }.
  guardar(usuario) { throw new Error('No implementado'); }
}
