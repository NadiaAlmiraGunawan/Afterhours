import 'package:afterhours/pages/login.page.dart';
import 'package:afterhours/providers/auth.providers.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';


void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()), // <-- TAMBAHKAN INI
      ],
      child: MaterialApp(
        title: 'Afterhours App',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.brown,
          scaffoldBackgroundColor: const Color(0xFFF5F5F5),
        ),
        home: const LoginPage(), // <-- Ubah home menjadi LoginPage
      ),
    );
  }
}