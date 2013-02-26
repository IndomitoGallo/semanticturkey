package it.uniroma2.art.semanticturkey.generation.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(value = RetentionPolicy.SOURCE)
@Target(value = { ElementType.TYPE, ElementType.METHOD })
public @interface STService {

}