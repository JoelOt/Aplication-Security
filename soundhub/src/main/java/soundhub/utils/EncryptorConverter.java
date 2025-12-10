package soundhub.utils;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.RequiredArgsConstructor;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Converter
@Component
@RequiredArgsConstructor
public class EncryptorConverter implements AttributeConverter<String, String> {

    @Qualifier("jasyptStringEncryptor")
    private final StringEncryptor encryptor;

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return attribute;
        }
        try {
            return encryptor.encrypt(attribute);
        } catch (Exception e) {
            throw new IllegalStateException("Error encrypting value: " + attribute, e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dataBaseData) {
        if (dataBaseData == null || dataBaseData.isEmpty()) {
            return dataBaseData;
        }
        try {
            return encryptor.decrypt(dataBaseData);
        } catch (Exception e) {
            throw new IllegalStateException("Error decrypting database value", e);
        }
    }
}
