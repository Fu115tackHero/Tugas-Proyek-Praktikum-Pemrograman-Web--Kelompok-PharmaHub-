-- ============================================
-- PHARMAHUB - DATABASE CONNECTION EXAMPLES
-- Contoh Konfigurasi Koneksi untuk Berbagai Teknologi
-- ============================================

-- ============================================
-- 1. NODE.JS / EXPRESS.JS
-- ============================================

-- Package: pg (node-postgres)
-- Install: npm install pg

/*
// config/database.js
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'pharmahub_db',
    user: 'postgres',
    password: 'your_password',
    max: 20, // Maximum number of clients
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected:', res.rows[0].now);
    }
});

module.exports = pool;
*/

-- Usage Example:
/*
// routes/users.js
const pool = require('../config/database');

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT user_id, name, email, phone FROM users WHERE user_id = $1',
            [id]
        );
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create user
app.post('/api/users', async (req, res) => {
    const { name, email, password_hash, phone } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email',
            [name, email, password_hash, phone, 'customer']
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Handle BYTEA (images)
app.post('/api/users/:id/photo', async (req, res) => {
    const { id } = req.params;
    const { photo_base64, mime_type, filename } = req.body;
    
    try {
        const photoBuffer = Buffer.from(photo_base64, 'base64');
        
        await pool.query(
            'UPDATE users SET profile_photo = $1, photo_mime_type = $2, photo_filename = $3 WHERE user_id = $4',
            [photoBuffer, mime_type, filename, id]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

// Get image
app.get('/api/users/:id/photo', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT profile_photo, photo_mime_type FROM users WHERE user_id = $1',
            [id]
        );
        
        if (result.rows.length > 0 && result.rows[0].profile_photo) {
            const photo = result.rows[0].profile_photo;
            const mimeType = result.rows[0].photo_mime_type;
            
            res.set('Content-Type', mimeType);
            res.send(photo);
        } else {
            res.status(404).json({ error: 'Photo not found' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to retrieve photo' });
    }
});
*/

-- ============================================
-- 2. PYTHON / FLASK
-- ============================================

-- Package: psycopg2
-- Install: pip install psycopg2-binary

/*
# config/database.py
import psycopg2
from psycopg2 import pool
import base64

# Create connection pool
connection_pool = psycopg2.pool.SimpleConnectionPool(
    1, 20,
    host='localhost',
    port=5432,
    database='pharmahub_db',
    user='postgres',
    password='your_password'
)

def get_db_connection():
    return connection_pool.getconn()

def release_db_connection(conn):
    connection_pool.putconn(conn)

# Test connection
def test_connection():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT NOW()')
        result = cursor.fetchone()
        print(f'Database connected: {result[0]}')
        cursor.close()
    finally:
        release_db_connection(conn)
*/

-- Usage Example:
/*
# routes/users.py
from flask import Flask, request, jsonify, send_file
from config.database import get_db_connection, release_db_connection
import base64
import io

app = Flask(__name__)

# Get user by ID
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT user_id, name, email, phone FROM users WHERE user_id = %s',
            (user_id,)
        )
        row = cursor.fetchone()
        cursor.close()
        
        if row:
            user = {
                'user_id': row[0],
                'name': row[1],
                'email': row[2],
                'phone': row[3]
            }
            return jsonify(user)
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print(f'Database error: {e}')
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        release_db_connection(conn)

# Create user
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (name, email, password_hash, phone, role) VALUES (%s, %s, %s, %s, %s) RETURNING user_id, name, email',
            (data['name'], data['email'], data['password_hash'], data['phone'], 'customer')
        )
        row = cursor.fetchone()
        conn.commit()
        cursor.close()
        
        user = {
            'user_id': row[0],
            'name': row[1],
            'email': row[2]
        }
        return jsonify(user), 201
    except Exception as e:
        conn.rollback()
        print(f'Database error: {e}')
        return jsonify({'error': 'Failed to create user'}), 500
    finally:
        release_db_connection(conn)

# Upload photo (BYTEA)
@app.route('/api/users/<int:user_id>/photo', methods=['POST'])
def upload_photo(user_id):
    data = request.json
    photo_base64 = data['photo_base64']
    mime_type = data['mime_type']
    filename = data['filename']
    
    # Decode base64 to binary
    photo_binary = base64.b64decode(photo_base64)
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE users SET profile_photo = %s, photo_mime_type = %s, photo_filename = %s WHERE user_id = %s',
            (psycopg2.Binary(photo_binary), mime_type, filename, user_id)
        )
        conn.commit()
        cursor.close()
        
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        print(f'Database error: {e}')
        return jsonify({'error': 'Failed to upload photo'}), 500
    finally:
        release_db_connection(conn)

# Get photo
@app.route('/api/users/<int:user_id>/photo', methods=['GET'])
def get_photo(user_id):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT profile_photo, photo_mime_type FROM users WHERE user_id = %s',
            (user_id,)
        )
        row = cursor.fetchone()
        cursor.close()
        
        if row and row[0]:
            photo_binary = bytes(row[0])
            mime_type = row[1]
            
            return send_file(
                io.BytesIO(photo_binary),
                mimetype=mime_type,
                as_attachment=False
            )
        else:
            return jsonify({'error': 'Photo not found'}), 404
    except Exception as e:
        print(f'Database error: {e}')
        return jsonify({'error': 'Failed to retrieve photo'}), 500
    finally:
        release_db_connection(conn)
*/

-- ============================================
-- 3. PHP / LARAVEL
-- ============================================

-- Extension: pdo_pgsql
-- Install: composer require illuminate/database

/*
// config/database.php
return [
    'default' => 'pgsql',
    
    'connections' => [
        'pgsql' => [
            'driver' => 'pgsql',
            'host' => env('DB_HOST', 'localhost'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'pharmahub_db'),
            'username' => env('DB_USERNAME', 'postgres'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'schema' => 'public',
            'sslmode' => 'prefer',
        ],
    ],
];
*/

-- Usage Example:
/*
// app/Http/Controllers/UserController.php
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Get user by ID
    public function show($id)
    {
        $user = DB::table('users')
            ->select('user_id', 'name', 'email', 'phone')
            ->where('user_id', $id)
            ->first();
        
        if ($user) {
            return response()->json($user);
        } else {
            return response()->json(['error' => 'User not found'], 404);
        }
    }
    
    // Create user
    public function store(Request $request)
    {
        $userId = DB::table('users')->insertGetId([
            'name' => $request->name,
            'email' => $request->email,
            'password_hash' => $request->password_hash,
            'phone' => $request->phone,
            'role' => 'customer',
            'created_at' => now(),
        ]);
        
        $user = DB::table('users')
            ->select('user_id', 'name', 'email')
            ->where('user_id', $userId)
            ->first();
        
        return response()->json($user, 201);
    }
    
    // Upload photo (BYTEA)
    public function uploadPhoto(Request $request, $id)
    {
        $photoBase64 = $request->photo_base64;
        $mimeType = $request->mime_type;
        $filename = $request->filename;
        
        // Decode base64
        $photoBinary = base64_decode($photoBase64);
        
        DB::table('users')
            ->where('user_id', $id)
            ->update([
                'profile_photo' => $photoBinary,
                'photo_mime_type' => $mimeType,
                'photo_filename' => $filename,
                'updated_at' => now(),
            ]);
        
        return response()->json(['success' => true]);
    }
    
    // Get photo
    public function getPhoto($id)
    {
        $user = DB::table('users')
            ->select('profile_photo', 'photo_mime_type')
            ->where('user_id', $id)
            ->first();
        
        if ($user && $user->profile_photo) {
            return response($user->profile_photo)
                ->header('Content-Type', $user->photo_mime_type);
        } else {
            return response()->json(['error' => 'Photo not found'], 404);
        }
    }
}
*/

-- ============================================
-- 4. JAVA / SPRING BOOT
-- ============================================

-- Dependency: postgresql JDBC driver
/*
<!-- pom.xml -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.5.0</version>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
*/

-- Configuration:
/*
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/pharmahub_db
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
*/

-- Usage Example:
/*
// Entity
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;
    
    private String name;
    private String email;
    
    @Column(name = "password_hash")
    private String passwordHash;
    
    private String phone;
    private String role;
    
    @Lob
    @Column(name = "profile_photo")
    private byte[] profilePhoto;
    
    @Column(name = "photo_mime_type")
    private String photoMimeType;
    
    // Getters and setters...
}

// Repository
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

// Service
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    public User createUser(User user) {
        user.setRole("customer");
        return userRepository.save(user);
    }
    
    public void uploadPhoto(Long userId, String photoBase64, String mimeType) {
        User user = getUserById(userId);
        byte[] photoBytes = Base64.getDecoder().decode(photoBase64);
        user.setProfilePhoto(photoBytes);
        user.setPhotoMimeType(mimeType);
        userRepository.save(user);
    }
}

// Controller
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User created = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PostMapping("/{id}/photo")
    public ResponseEntity<?> uploadPhoto(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        userService.uploadPhoto(id, payload.get("photo_base64"), payload.get("mime_type"));
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user.getProfilePhoto() != null) {
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(user.getPhotoMimeType()))
                .body(user.getProfilePhoto());
        }
        return ResponseEntity.notFound().build();
    }
}
*/

-- ============================================
-- 5. .NET / C#
-- ============================================

-- Package: Npgsql
-- Install: dotnet add package Npgsql

/*
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=pharmahub_db;Username=postgres;Password=your_password"
  }
}

// Startup.cs or Program.cs
services.AddNpgsql<AppDbContext>(Configuration.GetConnectionString("DefaultConnection"));

// DbContext
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
}

// Entity
public class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }
    
    public string Name { get; set; }
    public string Email { get; set; }
    
    [Column("password_hash")]
    public string PasswordHash { get; set; }
    
    public string Phone { get; set; }
    public string Role { get; set; }
    
    [Column("profile_photo")]
    public byte[] ProfilePhoto { get; set; }
    
    [Column("photo_mime_type")]
    public string PhotoMimeType { get; set; }
}

// Controller
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public UsersController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { error = "User not found" });
        
        return user;
    }
    
    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        user.Role = "customer";
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
    }
    
    [HttpPost("{id}/photo")]
    public async Task<ActionResult> UploadPhoto(int id, [FromBody] PhotoUploadDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();
        
        user.ProfilePhoto = Convert.FromBase64String(dto.PhotoBase64);
        user.PhotoMimeType = dto.MimeType;
        
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }
    
    [HttpGet("{id}/photo")]
    public async Task<ActionResult> GetPhoto(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null || user.ProfilePhoto == null)
            return NotFound();
        
        return File(user.ProfilePhoto, user.PhotoMimeType);
    }
}
*/

-- ============================================
-- 6. ENVIRONMENT VARIABLES (.env)
-- ============================================

/*
# .env file
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pharmahub_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_MAX_CONNECTIONS=20

# For production
# DB_HOST=your-production-db-host.com
# DB_SSL_MODE=require
*/

-- ============================================
-- END OF CONNECTION EXAMPLES
-- ============================================
