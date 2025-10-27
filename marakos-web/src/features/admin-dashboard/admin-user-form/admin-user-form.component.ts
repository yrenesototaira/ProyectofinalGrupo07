import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { UserType, Role, CreateUserRequest, UserDetailResponse } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-user-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-user-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);

  userId = signal<string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);
  
  // Available options
  userTypes = signal<UserType[]>([]);
  roles = signal<Role[]>([]);
  
  // Form fields
  userTypeId = signal<number | string | null>(null);
  email = signal('');
  // password y confirmPassword removidos
  firstName = signal('');
  lastName = signal('');
  phone = signal('');
  
  // Cliente specific fields
  photo = signal('');
  birthDate = signal('');
  documentId = signal('');
  refundAccount = signal('');
  
  // Empleado specific fields
  roleId = signal<number | null>(null);
  workShift = signal<number | null>(null);
  hireDate = signal('');
  employmentStatus = signal('ACTIVO');

  feedbackMessage = signal<{ type: 'success' | 'error', text: string } | null>(null);

  // Computed properties
  selectedUserType = computed(() => {
    const typeId = this.userTypeId();
    const numericTypeId = Number(typeId);
    return this.userTypes().find(type => type.id === numericTypeId);
  });

  isClientType = computed(() => {
    const userTypeId = this.userTypeId();
    // Convertir a number porque los valores del select vienen como string
    const numericUserTypeId = Number(userTypeId);
    const isClient = numericUserTypeId === 1;
    
    console.log('🔍 Debug isClientType:', {
      userTypeId: userTypeId,
      numericUserTypeId: numericUserTypeId,
      isClient: isClient,
      type: typeof userTypeId
    });
    
    return isClient;
  });

  isEmployeeType = computed(() => {
    const userTypeId = this.userTypeId();
    // Convertir a number porque los valores del select vienen como string
    const numericUserTypeId = Number(userTypeId);
    const isEmployee = numericUserTypeId === 2;
    
    console.log('🔍 Debug isEmployeeType:', {
      userTypeId: userTypeId,
      numericUserTypeId: numericUserTypeId,
      isEmployee: isEmployee,
      type: typeof userTypeId,
      numericType: typeof numericUserTypeId
    });
    
    return isEmployee;
  });

  // Computed properties ya no necesitan passwordsMatch

  ngOnInit() {
    this.loadUserTypes();
    this.loadRoles();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.userId.set(id);
      this.loadUserData(Number(id));
    }
  }

  loadUserData(userId: number) {
    this.adminService.getUserDetailById(userId).subscribe({
      next: (userDetail) => {
        console.log('📝 Loading user detail data for edit:', userDetail);
        
        // Cargar datos básicos del usuario
        this.email.set(userDetail.email);
        this.firstName.set(userDetail.firstName);
        this.lastName.set(userDetail.lastName);
        this.phone.set(userDetail.phone || '');
        
        // Determinar el tipo de usuario usando userTypeId
        this.userTypeId.set(userDetail.userTypeId);
        this.onUserTypeChange();
        
        // Cargar campos específicos de cliente si aplica (userTypeId === 1)
        if (userDetail.userTypeId === 1) {
          this.photo.set(userDetail.photo || '');
          this.birthDate.set(userDetail.birthDate || '');
          this.documentId.set(userDetail.documentId || '');
          this.refundAccount.set(userDetail.refundAccount || '');
        }
        
        // Cargar campos específicos de empleado si aplica (userTypeId === 2)
        if (userDetail.userTypeId === 2) {
          if (userDetail.roleId) {
            this.roleId.set(userDetail.roleId);
          }
          this.workShift.set(userDetail.workShift || null);
          this.hireDate.set(userDetail.hireDate || '');
          this.employmentStatus.set(userDetail.employmentStatus || 'ACTIVO');
        }
        
        console.log('✅ User detail data loaded successfully');
      },
      error: (error) => {
        console.error('❌ Error loading user detail data:', error);
        this.feedbackMessage.set({ 
          type: 'error', 
          text: 'Error al cargar los datos del usuario' 
        });
      }
    });
  }

  loadUserTypes() {
    this.adminService.getUserTypes().subscribe({
      next: (types) => {
        console.log('� User types loaded from API:', types);
        types.forEach((type, index) => {
          console.log(`🔥 User type ${index}:`, {
            id: type.id,
            name: type.name,
            nameType: typeof type.name,
            nameLength: type.name.length,
            nameBytes: Array.from(type.name).map(c => c.charCodeAt(0))
          });
        });
        this.userTypes.set(types);
      },
      error: (error) => {
        console.error('Error loading user types:', error);
        this.feedbackMessage.set({ type: 'error', text: 'Error al cargar tipos de usuario.' });
      }
    });
  }

  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.feedbackMessage.set({ type: 'error', text: 'Error al cargar roles.' });
      }
    });
  }

  onUserTypeChange() {
    console.log('🔄 User type changed:', {
      userTypeId: this.userTypeId(),
      selectedUserType: this.selectedUserType(),
      isEmployeeType: this.isEmployeeType(),
      userTypes: this.userTypes()
    });
    
    // Reset specific fields when user type changes
    this.roleId.set(null);
    this.workShift.set(null);
    this.hireDate.set('');
    this.photo.set('');
    this.birthDate.set('');
    this.documentId.set('');
    this.refundAccount.set('');
  }

  saveUser() {
    this.feedbackMessage.set(null);
    
    // Basic validation
    if (!this.userTypeId() || !this.email() || !this.firstName() || !this.lastName()) {
      this.feedbackMessage.set({ type: 'error', text: 'Por favor complete todos los campos requeridos.' });
      return;
    }

    // Employee specific validation
    if (this.isEmployeeType() && !this.roleId()) {
      this.feedbackMessage.set({ type: 'error', text: 'Debe seleccionar un rol para empleados.' });
      return;
    }

    this.isLoading.set(true);

    const request: CreateUserRequest = {
      userTypeId: Number(this.userTypeId()!),
      email: this.email(),
      // password eliminado - se establece mediante "Olvidé mi contraseña"
      firstName: this.firstName(),
      lastName: this.lastName(),
      phone: this.phone(),
    };

    // Add client-specific fields
    if (this.isClientType()) {
      request.photo = this.photo() || undefined;
      request.birthDate = this.birthDate() || undefined;
      request.documentId = this.documentId() || undefined;
      request.refundAccount = this.refundAccount() || undefined;
    }

    // Add employee-specific fields
    if (this.isEmployeeType()) {
      request.roleId = this.roleId()!;
      request.workShift = this.workShift() || undefined;
      request.hireDate = this.hireDate() || undefined;
      request.employmentStatus = this.employmentStatus();
    }

    // Choose between create or update
    const serviceCall = this.isEditMode() 
      ? this.adminService.updateUser(Number(this.userId()), request)
      : this.adminService.createUser(request);

    serviceCall.subscribe({
      next: (response) => {
        const actionText = this.isEditMode() ? 'actualizado' : 'creado';
        this.feedbackMessage.set({ type: 'success', text: `Usuario ${actionText} exitosamente` });
        setTimeout(() => {
          this.router.navigate(['/admin/users']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error saving user:', error);
        const actionText = this.isEditMode() ? 'actualizar' : 'crear';
        const errorMessage = error.error?.message || `Error al ${actionText} el usuario.`;
        this.feedbackMessage.set({ type: 'error', text: errorMessage });
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}