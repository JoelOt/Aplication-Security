package soundhub.utils;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.stereotype.Component;

@Converter
@Component
public class EncryptorConverter implements AttributeConverter<String, String> {

    private static StringEncryptor encryptor;

    public static void setEncryptor(StringEncryptor encryptor) {
        EncryptorConverter.encryptor = encryptor;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null)
            return null;
        try {
            return encryptor.encrypt(attribute);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting data", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null)
            return null;
        try {
            return encryptor.decrypt(dbData);
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting data", e);
        }
    }
}
