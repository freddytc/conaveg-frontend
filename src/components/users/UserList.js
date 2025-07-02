import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import UserForm from './UserForm';
import Modal from '../common/Modal';
import SuccessModal from '../common/SuccessModal';
import { useNotification } from '../../hooks/useNotification';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Hook para notificaciones
  const { notification, closeNotification, showError, showConfirm } = useNotification();

  // Estado para modal de éxito
  const [successModal, setSuccessModal] = useState({
    isVisible: false,
    message: '',
    title: '¡Éxito!'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const showSuccessModal = (message, title = '¡Éxito!') => {
    setSuccessModal({
      isVisible: true,
      message,
      title
    });
  };

  const hideSuccessModal = () => {
    setSuccessModal(prev => ({ ...prev, isVisible: false }));
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getAllUsers();
      console.log('Usuarios cargados:', response);
      const userArray = Array.isArray(response) ? response : [];
      setUsers(userArray);
      setFilteredUsers(userArray);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setError(error.message);
      setUsers([]);
      setFilteredUsers([]);
      showError(
        'Error al cargar usuarios',
        'No se pudieron cargar los usuarios. Por favor, intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
    
    if (term.trim() === '') {
      setFilteredUsers(users);
      return;
    }

    const searchLower = term.toLowerCase();
    const filtered = users.filter(user => {
      if (!user) return false;
      
      // Búsqueda en userName
      const matchesUserName = user.userName && 
        user.userName.toLowerCase().includes(searchLower);
      
      // Búsqueda en email
      const matchesEmail = user.email && 
        user.email.toLowerCase().includes(searchLower);
      
      // Búsqueda en rol
      let matchesRole = false;
      if (user.role) {
        if (typeof user.role === 'string') {
          matchesRole = user.role.toLowerCase().includes(searchLower);
        } else if (user.role.nombre) {
          matchesRole = user.role.nombre.toLowerCase().includes(searchLower);
        }
      }
      
      // Búsqueda en ID
      const matchesId = user.id && 
        user.id.toString().includes(searchLower);
      
      return matchesUserName || matchesEmail || matchesRole || matchesId;
    });
    
    setFilteredUsers(filtered);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (userId, userName) => {
    showConfirm(
      'Confirmar eliminación',
      `¿Está seguro de que desea eliminar el usuario "${userName}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await userService.deleteUser(userId);
          loadUsers();
          showSuccessModal('Usuario eliminado exitosamente', '¡Eliminado!');
        } catch (error) {
          showError(
            'Error al eliminar usuario',
            'No se pudo eliminar el usuario. Por favor, intente nuevamente.'
          );
        }
      }
    );
  };

  const handleFormSubmit = async (userData) => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, userData);
        
        setShowForm(false);
        setEditingUser(null);
        await loadUsers();
        
        showSuccessModal('El usuario se ha actualizado exitosamente', '¡Actualizado!');
        
      } else {
        await userService.createUser(userData);
        
        setShowForm(false);
        setEditingUser(null);
        await loadUsers();
        
        showSuccessModal('El usuario se ha creado exitosamente', '¡Creado!');
      }
    } catch (error) {
      showError(
        editingUser ? 'Error al actualizar usuario' : 'Error al crear usuario',
        error.message
      );
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  // Utilidad para formatear fechas de forma segura
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return '-';
    }
  };

  // Utilidad para obtener el nombre del rol de forma segura
  const getRoleName = (user) => {
    try {
      if (user && user.role) {
        if (typeof user.role === 'object' && user.role.nombre) {
          return user.role.nombre;
        }
        if (typeof user.role === 'string') {
          return user.role;
        }
      }
      return 'Sin rol';
    } catch (error) {
      console.error('Error obteniendo rol:', error);
      return 'Sin rol';
    }
  };

  // Utilidad para obtener el color del badge del rol
  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'ADMINISTRADOR':
        return 'badge-danger';
      case 'GERENTE':
        return 'badge-warning';
      case 'EMPLEADO':
        return 'badge-info';
      case 'USER':
        return 'badge-secondary';
      default:
        return 'badge-dark';
    }
  };

  // Paginación usando filteredUsers
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (showForm) {
    return (
      <UserForm
        user={editingUser}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <>
      <div className="page-inner">
        <div className="page-header">
          <h4 className="page-title">Gestión de Usuarios</h4>
          <ul className="breadcrumbs">
            <li className="nav-home">
              <a href="/dashboard">
                <i className="fas fa-home"></i>
              </a>
            </li>
            <li className="separator">
              <i className="fas fa-chevron-right"></i>
            </li>
            <li className="nav-item">
              <span>Usuarios</span>
            </li>
          </ul>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <h4 className="card-title">Lista de Usuarios</h4>
                  <button
                    className="btn btn-primary btn-round ml-auto"
                    onClick={() => setShowForm(true)}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Agregar Usuario
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-8">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por usuario, email, rol o ID..."
                        value={searchTerm}
                        onChange={handleSearch}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="sr-only">Cargando...</span>
                    </div>
                    <p className="mt-2 text-muted">Cargando usuarios...</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Creado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentUsers.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-4">
                                <div className="empty-state">
                                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                                  <h5 className="text-muted">No se encontraron usuarios</h5>
                                  <p className="text-muted">
                                    {searchTerm ? 'Intente con otros términos de búsqueda' : 'Comience agregando un nuevo usuario'}
                                  </p>
                                  {!searchTerm && (
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => setShowForm(true)}
                                    >
                                      <i className="fas fa-plus mr-2"></i>
                                      Agregar Primer Usuario
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : (
                            currentUsers.map((user) => {
                              const roleName = getRoleName(user);
                              
                              return (
                                <tr key={user.id || Math.random()}>
                                  <td>
                                    <span className="text-muted">{user.id || '-'}</span>
                                  </td>
                                  <td>
                                    <strong>{user.userName || '-'}</strong>
                                  </td>
                                  <td>
                                    <span className="text-muted">{user.email || '-'}</span>
                                  </td>
                                  <td>
                                    <span className={`badge ${getRoleBadgeColor(roleName)}`}>
                                      {roleName}
                                    </span>
                                  </td>
                                  <td>
                                    <small className="text-muted">{formatDate(user.createdAt)}</small>
                                  </td>
                                  <td>
                                    <div className="form-button-action">
                                      <button
                                        type="button"
                                        className="btn btn-link btn-primary btn-lg"
                                        onClick={() => handleEdit(user)}
                                        title="Editar Usuario"
                                        disabled={loading}
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      
                                      <button
                                        type="button"
                                        className="btn btn-link btn-danger btn-lg"
                                        onClick={() => handleDelete(user.id, user.userName)}
                                        title="Eliminar Usuario"
                                        disabled={loading}
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-4">
                        <nav>
                          <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                Anterior
                              </button>
                            </li>
                            
                            {[...Array(totalPages)].map((_, index) => (
                              <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => paginate(index + 1)}
                                >
                                  {index + 1}
                                </button>
                              </li>
                            ))}
                            
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                Siguiente
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    )}

                    {/* Información de registros */}
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        Mostrando {indexOfFirstUser + 1} a {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
                        {searchTerm && filteredUsers.length !== users.length && (
                          <> (filtrados de {users.length} total)</>
                        )}
                      </small>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmaciones y errores */}
      <Modal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        onConfirm={notification.onConfirm}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
        showCancel={notification.showCancel}
      />

      {/* Modal de éxito centrado */}
      <SuccessModal
        isVisible={successModal.isVisible}
        message={successModal.message}
        title={successModal.title}
        onClose={hideSuccessModal}
        duration={750}
      />
    </>
  );
};

export default UserList;