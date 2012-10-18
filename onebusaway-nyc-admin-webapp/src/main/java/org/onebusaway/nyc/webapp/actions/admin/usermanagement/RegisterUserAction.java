package org.onebusaway.nyc.webapp.actions.admin.usermanagement;

import org.apache.commons.lang.StringUtils;
import org.onebusaway.nyc.admin.service.UserManagementService;
import org.onebusaway.nyc.webapp.actions.OneBusAwayNYCAdminActionSupport;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * Creates a user in the database. 
 * @author abelsare
 *
 */
public class RegisterUserAction extends OneBusAwayNYCAdminActionSupport {

	private static final long serialVersionUID = 1L;
	private String username;
	private String password;
	private boolean admin;
	
	private UserManagementService userManagementService;
	
	/**
	 * Creates a new user in the system.
	 * @return success message
	 */
	public String createUser() {
		boolean valid = validateFields();
		if(valid) {
			boolean success = userManagementService.createUser(username, password, admin);
			
			if(success) {
				addActionMessage("User '" +username + "' created successfully");
				return SUCCESS;
			} else {
				addActionError("Error creating user : '" +username + "'");
			}
		}
		
		return ERROR;

	}
	
	
	private boolean validateFields() {
		boolean valid = true;
		
		if(StringUtils.isBlank(username)) {
			valid = false;
			addFieldError("username", "User name is required");
		}
		
		if(StringUtils.isBlank(password)) {
			valid = false;
			addFieldError("password", "Password is required");
		}
		
		return valid;
	}
	
	public void init() {
		createUser();
	}
	

	/**
	 * Returns user name of the user being created
	 * @return the username
	 */
	public String getUsername() {
		return username;
	}

	/**
	 * Injects user name of the user being created
	 * @param username the username to set
	 */
	public void setUsername(String username) {
		this.username = username;
	}

	/**
	 * Returns password of the user being created
	 * @return the password
	 */
	public String getPassword() {
		return password;
	}

	/**
	 * Injects password of the user being created
	 * @param password the password to set
	 */
	public void setPassword(String password) {
		this.password = password;
	}

	/**
	 * Returns true if the user is created as admin
	 * @return the admin
	 */
	public boolean isAdmin() {
		return admin;
	}

	/**
	 * Injects true if user is created as admin
	 * @param admin the admin to set
	 */
	public void setAdmin(boolean admin) {
		this.admin = admin;
	}

	/**
	 * @param userManagementService the userManagementService to set
	 */
	@Autowired
	public void setUserManagementService(UserManagementService userManagementService) {
		this.userManagementService = userManagementService;
	}
}