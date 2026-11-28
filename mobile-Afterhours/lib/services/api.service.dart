import 'package:afterhours/config/api.config.dart';
import 'package:afterhours/services/token.services.dart';
import 'package:http/http.dart' as http;


class ApiService {
  // Helper untuk GET request (membaca data)
  static Future<http.Response> get(String endpoint) async {
    final token = await TokenService.getToken();
    
    return await http.get(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
  }

  // Helper untuk POST request (mengirim data JSON)
  static Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    final token = await TokenService.getToken();

    return await http.post(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: body.isNotEmpty ? body : null,
    );
  }

  // Untuk upload file (form-data), nanti kita buat di step produk
}