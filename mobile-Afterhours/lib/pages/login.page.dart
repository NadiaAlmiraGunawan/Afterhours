import 'package:afterhours/pages/register.page.dart';
import 'package:afterhours/providers/auth.providers.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isObscure = true;

  void _handleLogin() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    final success = await authProvider.login(
      _emailController.text,
      _passwordController.text,
    );

    if (success && mounted) {
      // Cek Role, nanti kita arahkan ke halaman yang berbeda
      // Sementara, kita tampilkan SnackBar sukses
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Login Berhasil!')),
      );
      // TODO: Navigate to HomePage
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(authProvider.errorMessage)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.local_cafe, size: 80, color: Colors.brown),
              const SizedBox(height: 20),
              const Text(
                'Afterhours',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.brown),
              ),
              const SizedBox(height: 40),
              
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.email),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              
              TextField(
                controller: _passwordController,
                obscureText: _isObscure,
                decoration: InputDecoration(
                  labelText: 'Password',
                  border: const OutlineInputBorder(),
                  prefixIcon: const Icon(Icons.lock),
                  suffixIcon: IconButton(
                    icon: Icon(_isObscure ? Icons.visibility : Icons.visibility_off),
                    onPressed: () => setState(() => _isObscure = !_isObscure),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              ElevatedButton(
                onPressed: authProvider.isLoading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.brown,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: authProvider.isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Login', style: TextStyle(fontSize: 16)),
              ),
              
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const RegisterPage()),
                  );
                },
                child: const Text('Belum punya akun? Daftar di sini'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}