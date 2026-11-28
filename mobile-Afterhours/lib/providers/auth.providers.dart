import 'package:afterhours/models/user.models.dart';
import 'package:afterhours/services/auth.services.dart';
import 'package:flutter/material.dart';


class AuthProvider with ChangeNotifier {
  UserModel? _user;
  bool _isLoading = false;
  String _errorMessage = '';

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  String get errorMessage => _errorMessage;
  bool get isAuthenticated => _user != null;

  // Fungsi Login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    final response = await AuthService.login(email, password);

    _isLoading = false;

    if (response['success']) {
      // Ambil data user dari response API
      _user = UserModel.fromJson(response['data']['user']);
      notifyListeners();
      return true;
    } else {
      _errorMessage = response['message'] ?? 'Login gagal';
      notifyListeners();
      return false;
    }
  }

  // Fungsi Register
  Future<bool> register(String name, String email, String password) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    final response = await AuthService.register(name, email, password);
    _isLoading = false;

    if (response['success']) {
      notifyListeners();
      return true;
    } else {
      _errorMessage = response['message'] ?? 'Registrasi gagal';
      notifyListeners();
      return false;
    }
  }

  // Fungsi Logout
  Future<void> logout() async {
    await AuthService.logout();
    _user = null;
    notifyListeners();
  }
}