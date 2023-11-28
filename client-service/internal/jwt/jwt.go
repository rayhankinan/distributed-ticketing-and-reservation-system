package jwt

import (
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
)

type CustomClaims struct {
	UserID string `json:"userId"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

// should be in env but just hardcode :D
var jwtKey = []byte("dhika-jelek")

func GenerateJWT(userID uuid.UUID, role string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &CustomClaims{
		UserID: userID.String(),
		Role:   role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)

	return tokenString, err
}
