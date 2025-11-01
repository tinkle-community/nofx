package auth

import (
	"crypto/rand"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/pquerna/otp/totp"
	"golang.org/x/crypto/bcrypt"
)

// JWTSecret JWT密钥，将从配置中动态设置
var JWTSecret []byte

// AdminMode 管理员模式标志
var AdminMode bool = false

// OTPIssuer OTP发行者名称
const OTPIssuer = "nofxAI"

// SetJWTSecret 设置JWT密钥
func SetJWTSecret(secret string) {
	JWTSecret = []byte(secret)
}

// SetAdminMode 设置管理员模式
func SetAdminMode(enabled bool) {
	AdminMode = enabled
}

// IsAdminMode 检查是否为管理员模式
func IsAdminMode() bool {
	return AdminMode
}

// Claims JWT声明
type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// HashPassword 哈希密码
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword 验证密码
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateOTPSecret 生成OTP密钥
func GenerateOTPSecret() (string, error) {
	secret := make([]byte, 20)
	_, err := rand.Read(secret)
	if err != nil {
		return "", err
	}
	
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      OTPIssuer,
		AccountName: uuid.New().String(),
	})
	if err != nil {
		return "", err
	}
	
	return key.Secret(), nil
}

// VerifyOTP 验证OTP码
func VerifyOTP(secret, code string) bool {
	return totp.Validate(code, secret)
}

// GenerateJWT 生成JWT token
func GenerateJWT(userID, email string) (string, error) {
	claims := Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // 24小时过期
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "nofxAI",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JWTSecret)
}

// ValidateJWT 验证JWT token
func ValidateJWT(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("意外的签名方法: %v", token.Header["alg"])
		}
		return JWTSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("无效的token")
}

// GetOTPQRCodeURL 获取OTP二维码URL
func GetOTPQRCodeURL(secret, email string) string {
	return fmt.Sprintf("otpauth://totp/%s:%s?secret=%s&issuer=%s", OTPIssuer, email, secret, OTPIssuer)
}