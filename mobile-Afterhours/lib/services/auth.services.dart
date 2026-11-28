import 'dart:convert';
import 'package:afterhours/config/api.config.dart';
import 'package:afterhours/services/token.services.dart';
import 'package:http/http.dart' as http;


class AuthService {
  // Fungsi untuk Login
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // Jika sukses, simpan token ke secure storage
        await TokenService.saveToken(data['data']['token']);
        return data;
      } else {
        // Jika gagal (misal password salah)
        return data;
      }
    } catch (e) {
      return {'success': false, 'message': 'Gagal terhubung ke server'};
    }
  }

  // Fungsi untuk Register
  static Future<Map<String, dynamic>> register(
      String name, String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'name': name, 'email': email, 'password': password}),
      );

      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {'success': false, 'message': 'Gagal terhubung ke server'};
    }
  }

  // Fungsi untuk Logout
  static Future<void> logout() async {
    await TokenService.deleteToken();
  }
}