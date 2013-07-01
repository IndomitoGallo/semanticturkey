package it.uniroma2.art.semanticturkey.generation.annotation.processor;

import it.uniroma2.art.semanticturkey.generation.annotation.STService;

import java.io.IOException;
import java.io.Writer;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.ExecutableElement;
import javax.lang.model.element.PackageElement;
import javax.lang.model.element.TypeElement;
import javax.lang.model.element.VariableElement;
import javax.tools.JavaFileObject;

import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;


@SupportedAnnotationTypes("it.uniroma2.art.semanticturkey.generation.annotation.STService")
@SupportedSourceVersion(SourceVersion.RELEASE_6)
public class STServiceProcessor extends AbstractProcessor {

	public STServiceProcessor() {
		super();
	}

	@Override
	public boolean process(Set<? extends TypeElement> annotations,
			RoundEnvironment roundEnv) {
		System.out.println("generating:");
		for (Element i : roundEnv
				.getElementsAnnotatedWith(STService.class)) {
			if (i.getKind() != ElementKind.CLASS)
				continue;

			String fqClassName = null;
			String className = null;
			String packageName = null;
			Map<String, VariableElement> fields = new HashMap<String, VariableElement>();
			Map<String, ExecutableElement> methods = new HashMap<String, ExecutableElement>();
			TypeElement classElement = (TypeElement) i;
			PackageElement packageElement = (PackageElement) classElement
					.getEnclosingElement();

			System.out.println("annotated class: "
					+ classElement.getQualifiedName());

			fqClassName = classElement.getQualifiedName().toString();
			className = classElement.getSimpleName().toString();
			packageName = packageElement.getQualifiedName().toString();

			for (Element e : roundEnv
					.getElementsAnnotatedWith(STService.class)) {
				if (e.getKind() == ElementKind.FIELD) {
					
					System.out.println(fqClassName+" "+(TypeElement) e.getEnclosingElement());

					if (!((TypeElement) e.getEnclosingElement())
							.getQualifiedName().toString().equals(fqClassName))
						continue;

					VariableElement varElement = (VariableElement) e;

					System.out.println("annotated field: "
							+ varElement.getSimpleName());
					fields.put(varElement.getSimpleName().toString(),
							varElement);

				} else if (e.getKind() == ElementKind.METHOD) {
					
					System.out.println(fqClassName+" "+(TypeElement) e.getEnclosingElement());
					
					if (!((TypeElement) e.getEnclosingElement())
							.getQualifiedName().toString().equals(fqClassName))
						continue;

					ExecutableElement exeElement = (ExecutableElement) e;
					

					System.out.println("annotated method: "
							+ exeElement.getSimpleName());

					methods.put(exeElement.getSimpleName().toString(),
							exeElement);
				}

			}
			if (fqClassName != null) {

				Properties props = new Properties();
				URL url = this.getClass().getClassLoader()
						.getResource("velocity.properties");
				try {
					props.load(url.openStream());
				} catch (IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}

				VelocityEngine ve = new VelocityEngine(props);
				ve.init();

				VelocityContext vc = new VelocityContext();

				vc.put("className", className);
				vc.put("packageName", packageName);
				vc.put("fields", fields);
				vc.put("methods", methods);

				Template vt = ve.getTemplate("beaninfo.vm");

				JavaFileObject jfo;
				try {
					jfo = processingEnv.getFiler().createSourceFile(
							fqClassName + "Controller");
					System.out.println("creating source file: " + jfo.toUri());

					Writer writer = jfo.openWriter();

					System.out.println("applying velocity template: "
							+ vt.getName());

					vt.merge(vc, writer);

					writer.close();
				} catch (IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}

			}
		}

		return true;
	}

}